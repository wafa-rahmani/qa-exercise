from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import secrets

app = FastAPI()

class LoginRequest(BaseModel):
    user: int
    password: str

@app.post("/api/login")
async def login(req: LoginRequest):
    token = secrets.token_urlsafe(16)
    return {
        "user": req.user,
        "token": token,
        "expires_in": 3600,
    }

def main() -> None:
    uvicorn.run(app, host="127.0.0.1", port=8085)

if __name__ == "__main__":
    main()
