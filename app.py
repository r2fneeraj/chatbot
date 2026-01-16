from flask import Flask, render_template, request, jsonify
import json
import os
import uuid

app = Flask(__name__)
DATA_FILE = "leads.json"


def load_leads():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_leads(leads):
    with open(DATA_FILE, "w") as f:
        json.dump(leads, f, indent=4)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/save-lead", methods=["POST"])
def save_lead_api():
    data = request.json or {}

    lead = {
        "id": str(uuid.uuid4()),
        "service": data.get("service", ""),
        "requirement": data.get("requirement", ""),
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "createdAt": data.get("createdAt", ""),
        "status": "New",
        "notes": ""
    }

    leads = load_leads()
    leads.append(lead)
    save_leads(leads)

    return jsonify({"status": "success", "lead_id": lead["id"]})


@app.route("/admin")
def admin():
    leads = load_leads()
    leads = list(reversed(leads))  # newest first
    return render_template("admin.html", leads=leads)


if __name__ == "__main__":
    app.run(debug=True)
