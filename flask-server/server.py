from flask import Flask, send_file, request, jsonify, send_from_directory
from reportlab.pdfgen import canvas
import os

app = Flask(__name__)

# 确保reports文件夹存在，并且是在Flask应用的根目录下
reports_dir = os.path.join(app.root_path, 'reports')
os.makedirs(reports_dir, exist_ok=True)

@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.json
    person_name = data.get('person')
    linkedin_url = data.get('linkedin_url')

    # 文件路径
    file_path = os.path.join(reports_dir, f"{person_name}_report.pdf")

    # 创建一个PDF文件并保存到文件系统
    c = canvas.Canvas(file_path)
    c.drawString(100, 750, f"Report for: {person_name}")
    c.drawString(100, 730, f"LinkedIn URL: {linkedin_url}")
    c.showPage()
    c.save()

    # 提供一个URL以供下载
    report_url = f"http://{request.host}/reports/{os.path.basename(file_path)}"

    # 返回AI的回复和下载报告的链接
    return jsonify({
        'message': f'Okay, here is a one page report on {person_name}, would you like to download the report?',
        'report_url': report_url
    })

@app.route('/reports/<filename>')
def report(filename):
    return send_from_directory(reports_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
