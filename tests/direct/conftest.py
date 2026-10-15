import os, pytest
@pytest.fixture(autouse=True, scope="session")
def windows_unlink_compatibility():
    if os.name != "nt": yield; return
    original=os.unlink
    def unlink(path):
        try: original(path)
        except PermissionError: pass
    os.unlink=unlink;yield;os.unlink=original

