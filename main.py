from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# 允许跨域，方便前端调试
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟的日志数据
mock_lines = [
    {"type": "stdout", "content": "扫描开始..."},
    {"type": "instruction", "content": "执行 nmap -sV 127.0.0.1"},
    {
        "type": "structure",
        "content": '{"host": "127.0.0.1", "open_ports": [22, 80, 443]}',
    },
    {"type": "stdout", "content": "扫描结束，结果保存在 output.json"},
]


@app.get("/scan/output")
def get_scan_output(offset: int = Query(0, description="从哪个下标开始拉新行")):
    """
    返回模拟的扫描日志，前端可通过 `?offset=数字` 获取从该偏移之后的内容
    """
    # 根据 offset 切片
    lines = mock_lines[offset:]
    total = len(mock_lines)
    return {"lines": lines, "total": total}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
