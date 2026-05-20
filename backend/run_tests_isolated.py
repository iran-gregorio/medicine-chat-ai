import os
import sys
import pytest

# Create a local tmp directory in the workspace
workspace_dir = os.path.dirname(os.path.abspath(__file__))
tmp_dir = os.path.join(workspace_dir, "tmp")
os.makedirs(tmp_dir, exist_ok=True)

# Set environment variables for temporary files to the local tmp dir
os.environ["TMPDIR"] = tmp_dir
os.environ["TEMP"] = tmp_dir
os.environ["TMP"] = tmp_dir
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

if __name__ == "__main__":
    # Run pytest programmatically
    sys.exit(pytest.main([
        "tests/",
        "-v",
        "-o", f"cache_dir={tmp_dir}"
    ]))
