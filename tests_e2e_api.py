import requests

BASE_URL = "http://localhost:8000/auth"

def test_e2e_flow():
    print("Testing E2E Authentication Flow...")
    
    # 1. Register
    print("1. Registering user...")
    reg_res = requests.post(f"{BASE_URL}/register", json={
        "full_name": "E2E Test User",
        "email": "e2e@example.com",
        "phone": "11999999998",
        "password": "StrongPassword123!"
    })
    
    if reg_res.status_code not in (200, 400): # 400 if already exists
        print(f"Failed to register: {reg_res.text}")
        return
        
    print("User registered or already exists.")

    # 2. Login
    print("2. Logging in...")
    login_res = requests.post(f"{BASE_URL}/login", json={
        "identifier": "e2e@example.com",
        "password": "StrongPassword123!"
    })
    
    if login_res.status_code != 200:
        print(f"Failed to login: {login_res.text}")
        return
        
    tokens = login_res.json()
    print(f"Logged in successfully. Access token: {tokens.get('access_token')[:10]}...")

    # 3. Forgot Password
    print("3. Requesting password reset...")
    forgot_res = requests.post(f"{BASE_URL}/forgot-password", json={
        "email": "e2e@example.com"
    })
    
    if forgot_res.status_code != 200:
        print(f"Failed to request forgot password: {forgot_res.text}")
        return
        
    print(f"Forgot password requested: {forgot_res.json()}")
    
    print("E2E Flow completed successfully (Reset requires token from DB/Email).")

if __name__ == "__main__":
    test_e2e_flow()
