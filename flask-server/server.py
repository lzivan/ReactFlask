# from flask import Flask

# app = Flask(__name__)

# @app.route("/members")
# def members():
#     return {'members': ['John', 'Tom', 'Jerry']}

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.json
    person_name = data.get('person')
    linkedin_url = data.get('linkedin_url')
    
    # 这里可以添加逻辑以生成报告，并返回报告的链接
    report_url = "http://example.com/report.pdf"  # 假设报告的链接

    return jsonify({
        'message': f"Okay, here is a one page report on {person_name} ({linkedin_url}), would you like to download the report?",
        'report_url': report_url
    })

if __name__ == '__main__':
    app.run(debug=True)
