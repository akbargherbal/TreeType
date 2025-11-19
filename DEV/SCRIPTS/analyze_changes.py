import sys
import subprocess
import difflib
from pathlib import Path
from tree_sitter import Language, Parser
import tree_sitter_typescript as tstypescript

# --- Colors for Terminal Output ---
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# --- Configuration ---
CONFIG = {
    '.ts': {
        'language_fn': tstypescript.language_typescript,
        'formatter': ['npx', 'prettier', '--parser', 'typescript'],
    },
    '.tsx': {
        'language_fn': tstypescript.language_tsx,
        'formatter': ['npx', 'prettier', '--parser', 'typescript'],
    }
}

def get_git_content(commit_hash, file_path):
    try:
        cmd = ['git', 'show', f'{commit_hash}:{file_path}']
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError:
        print(f"{Colors.RED}Error: Could not retrieve {file_path} from {commit_hash}{Colors.RESET}")
        sys.exit(1)

def normalize_code(code, extension):
    if extension not in CONFIG: return code
    formatter_cmd = CONFIG[extension]['formatter']
    try:
        process = subprocess.Popen(formatter_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input=code)
        return stdout if process.returncode == 0 else code
    except FileNotFoundError:
        return code

def extract_entities(code_bytes, language_fn):
    lang = Language(language_fn())
    parser = Parser(lang)
    tree = parser.parse(code_bytes)
    entities = {}
    
    def visit(node):
        name = None
        # Capture Functions, Classes, Methods, and Arrow Functions assigned to vars
        if node.type in ['function_declaration', 'class_declaration', 'method_definition']:
            name_node = node.child_by_field_name('name')
            if name_node: name = name_node.text.decode('utf8')
        elif node.type == 'lexical_declaration':
            for child in node.children:
                if child.type == 'variable_declarator':
                    name_node = child.child_by_field_name('name')
                    val_node = child.child_by_field_name('value')
                    if name_node and val_node and val_node.type == 'arrow_function':
                        name = name_node.text.decode('utf8')

        if name:
            # Store code AND metadata
            entities[name] = {
                'code': code_bytes[node.start_byte:node.end_byte].decode('utf8'),
                'start_line': node.start_point[0] + 1,
                'end_line': node.end_point[0] + 1,
                'type': node.type
            }
        
        for child in node.children:
            visit(child)

    visit(tree.root_node)
    return entities

def print_diff(name, old_entity, new_entity):
    old_lines = old_entity['code'].splitlines()
    new_lines = new_entity['code'].splitlines()
    
    diff = difflib.unified_diff(old_lines, new_lines, lineterm='')
    
    print(f"{Colors.YELLOW}⚡ MODIFIED: {Colors.BOLD}{name}{Colors.RESET} (Lines {new_entity['start_line']}-{new_entity['end_line']})")
    
    # Skip the first 2 lines of unified diff (filenames)
    diff_list = list(diff)[2:]
    
    if not diff_list:
        print(f"  {Colors.BLUE}(Internal logic unchanged, likely comment/formatting shift){Colors.RESET}")
        return

    for line in diff_list:
        if line.startswith('+'):
            print(f"  {Colors.GREEN}{line}{Colors.RESET}")
        elif line.startswith('-'):
            print(f"  {Colors.RED}{line}{Colors.RESET}")
        elif line.startswith('@@'):
            print(f"  {Colors.BLUE}{line}{Colors.RESET}")
        else:
            print(f"  {line}")
    print("")

def main():
    if len(sys.argv) < 4:
        print("Usage: python analyze_changes_v3.py <file_path> <commit_old> <commit_new>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    commit_old = sys.argv[2]
    commit_new = sys.argv[3]
    ext = Path(file_path).suffix
    
    if ext not in CONFIG:
        print(f"Unsupported extension: {ext}"); sys.exit(1)

    print(f"{Colors.HEADER}--- Semantic Analysis: {file_path} ---{Colors.RESET}")
    print(f"{Colors.BLUE}Comparing {commit_old[:7]} -> {commit_new[:7]}{Colors.RESET}\n")
    
    raw_old = get_git_content(commit_old, file_path)
    raw_new = get_git_content(commit_new, file_path)
    
    norm_old = normalize_code(raw_old, ext)
    norm_new = normalize_code(raw_new, ext)
    
    lang_fn = CONFIG[ext]['language_fn']
    entities_old = extract_entities(norm_old.encode('utf8'), lang_fn)
    entities_new = extract_entities(norm_new.encode('utf8'), lang_fn)
    
    old_keys = set(entities_old.keys())
    new_keys = set(entities_new.keys())
    
    added = sorted(list(new_keys - old_keys))
    removed = sorted(list(old_keys - new_keys))
    common = old_keys & new_keys
    modified = sorted([k for k in common if entities_old[k]['code'] != entities_new[k]['code']])

    if not (added or removed or modified):
        print(f"{Colors.GREEN}✅ No structural logic changes detected.{Colors.RESET}")
        return

    # 1. Show Modifications with Diffs
    for name in modified:
        print_diff(name, entities_old[name], entities_new[name])

    # 2. Show Additions
    if added:
        print(f"{Colors.GREEN}✨ ADDED FUNCTIONS/CLASSES:{Colors.RESET}")
        for name in added:
            ent = entities_new[name]
            print(f"  + {Colors.BOLD}{name}{Colors.RESET} (Lines {ent['start_line']}-{ent['end_line']})")

    # 3. Show Deletions
    if removed:
        print(f"{Colors.RED}🔥 REMOVED FUNCTIONS/CLASSES:{Colors.RESET}")
        for name in removed:
            print(f"  - {Colors.BOLD}{name}{Colors.RESET}")

if __name__ == "__main__":
    main()