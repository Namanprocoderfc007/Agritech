from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)

try:
    response = client.get("/market/prices?crop=wheat&quantity=10&lat=22.6&lon=88.3")
    print(response.status_code)
    print(response.json())
except Exception as e:
    traceback.print_exc()
