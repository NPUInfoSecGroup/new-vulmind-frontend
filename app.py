from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
import json
import uuid

app = Flask(__name__)
CORS(app)

# @app.route('/api/data', methods=['POST'])
# def get_data():
#     data = request.json
#     return jsonify({"received": data})


@app.route("/tasks", methods=["GET"])
def get_tasks():
    with open("db.json", "r", encoding="utf-8") as f:
        tasks = json.load(f)
    return jsonify(tasks)


@app.route("/tasks", methods=["POST"])
def add_task():
    """
    Add a new task to the db.json file.
    task format:
    {
      "name": "示例任务 - 完成有高危漏洞",
      "target": "http://example.com",
      "command": "scan --deep",
      "status": "completed",
      "startTime": "2025-06-17T08:00:00Z",
      "results": [
        {
          "resultId": "r-87e4c8f2",
          "severity": "high",
          "vulnType": "SQL Injection",
          "details": "检测到数据库注入漏洞，建议使用参数化查询。"
        }
      ]
    }
    """
    new_task = request.json
    task_id = str(uuid.uuid4())
    new_task["id"] = task_id

    with open("db.json", "r+", encoding="utf-8") as f:
        try:
            data = json.load(f)
            if not isinstance(data, dict) or "tasks" not in data:
                data = {"tasks": []}
        except json.JSONDecodeError:
            data = {"tasks": []}

        if task_id in [task["id"] for task in data["tasks"]]:
            return jsonify({"error": "Task with this ID already exists."}), 400

        data["tasks"].append(new_task)
        f.seek(0)
        f.truncate()
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify(new_task), 201


@app.route("/tasks/<task_id>", methods=["GET"])
def get_task(task_id):
    with open("db.json", "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "data file format error"}), 500

        for task in data.get("tasks", []):
            if task.get("id") == task_id:
                return jsonify(task), 200

    return jsonify({"error": "task not found"}), 404


@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    """
    Update an existing task in the db.json file.
    task format:
    {
        "name": "更新后的任务名称",
        "status": "running"
    }
    """

    update_data = request.json
    update_data.pop("id", None)  # 禁止更新id字段

    with open("db.json", "r+", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "data file format error"}), 500

        updated = None
        for task in data.get("tasks", []):
            if task.get("id") == task_id:
                task.update(update_data)
                updated = task
                break

        if not updated:
            return jsonify({"error": "task not found"}), 404

        f.seek(0)
        f.truncate()
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify(updated), 200


@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    with open("db.json", "r+", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "data file format error"}), 500

        original_tasks = data.get("tasks", [])
        new_tasks = [task for task in original_tasks if task.get("id") != task_id]

        if len(original_tasks) == len(new_tasks):
            return jsonify({"error": "task not found"}), 404

        data["tasks"] = new_tasks
        f.seek(0)
        f.truncate()
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "task deleted"}), 204


@app.route("/tasks/<task_id>/start", methods=["POST"])
def start_task(task_id):
    timestamp = datetime.now(timezone.utc).isoformat()

    with open("db.json", "r+", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "data file format error"}), 500

        for task in data.get("tasks", []):
            if task.get("id") == task_id:
                task["status"] = "running"
                task["startTime"] = timestamp
                f.seek(0)
                f.truncate()
                json.dump(data, f, ensure_ascii=False, indent=2)
                return jsonify(task), 200

    return jsonify({"error": "task not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
