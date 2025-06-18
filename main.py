from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

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
        "type": "1",
        "content": '{"host": "127.0.0.1", "open_ports": [22, 80, 443]}',
    },
]


@app.get("/scan/output")
def get_scan_output(offset: int = Query(0, description="从哪个下标开始拉新行")):
    """
    返回模拟的扫描日志，前端可通过 `?offset=数字` 获取从该偏移之后的内容
    """
    lines = mock_lines[offset:]
    total = len(mock_lines)
    return {"lines": lines, "total": total}


# 请求模型定义
class AgentStartRequest(BaseModel):
    goal: str
    target: str
    iteration_limit: int = 5


class ChatRequest(BaseModel):
    message: str


@app.post("/agent/start")
async def agent_start(req: AgentStartRequest):
    # 模拟启动 Agent 模式
    return {"initialized": True, "goal": req.goal, "target": req.target}


@app.post("/agent/step")
async def agent_step():
    # 模拟单步执行
    dummy_log = {"ai_response": "模拟渗透测试步骤完成。"}
    return {"logs": [dummy_log], "tree": {}}


@app.get("/agent/status")
async def agent_status():
    # 模拟状态：一次后停止
    return {"running": False, "iteration": 1}


@app.post("/chat/send")
async def chat_send(req: ChatRequest = Body(...)):
    # 返回一段 Markdown，用于前端展示
    markdown_output = """
## 渗透测试报告

**目标**: {}

**步骤**:

1. 扫描开放端口
2. 检测服务版本
3. 漏洞验证

```bash
nmap -sV {target}
```  

> 模拟 Markdown 内容，用于前端渲染测试
""".format(
        req.message, target=req.message
    )
    return {"response": markdown_output}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
