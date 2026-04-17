from flask import Flask, request, jsonify
import matlab.engine
import os
app = Flask(__name__)

print("Starting MATLAB engine...")

matlab_path=r"./matlab"
eng = matlab.engine.start_matlab("-nojvm -nodisplay")


# CHANGE this path to your matlab scripts folder
eng.addpath(matlab_path, nargout=0)

print("MATLAB engine started")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "MATLAB service running"})

@app.route("/process", methods=["POST"])
def process_packet():
    data = request.json
    packet = data.get("packet")

    if not packet:
        return jsonify({"error": "No packet provided"}), 400

    try:
        
        result = eng.whisperEngine(packet)
        return jsonify({"decoded": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)