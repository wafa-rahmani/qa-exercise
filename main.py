import httpx
from fastapi import FastAPI, Request, HTTPException
import uvicorn

from config import get_settings

config = get_settings()
app = FastAPI()

@app.api_route("/{path:path}", methods=["POST"])
async def proxy_request(request: Request, path: str)-> dict:
    url = f"http://{config.PROXY_TARGET_HOST}:{config.PROXY_TARGET_PORT}/{path}"

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON request body")
    if "user" not in body:
        raise HTTPException(status_code=400, detail="Missing 'user' key in request body")
    async with httpx.AsyncClient() as client:
        response = await client.request(method=request.method, url=url, json=body)
        return await process_response(response=response)
    
async def process_response(response: httpx.Response):

    try:
        body = response.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON response body")

    if "user" not in body:
        raise HTTPException(status_code=400, detail="Missing 'user' key in response body")

    body.pop("user", None)
    return body

def main():
    uvicorn.run(app, host=config.PROXY_SERVICE_HOST, port=config.PROXY_SERVICE_PORT)


if __name__ == "__main__":
    main()
