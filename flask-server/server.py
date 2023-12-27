from flask import Flask, send_file, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import os


app = Flask(__name__)

reports_dir = os.path.join(app.root_path, 'reports')
os.makedirs(reports_dir, exist_ok=True)

# initialize database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobseeker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    industry = db.Column(db.String(120), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    roles = db.relationship('Role', backref='company', lazy='dynamic')  

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)  

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(80), nullable=False)
    companies = db.relationship('Company', backref='location', lazy='dynamic')  

def get_company_details(company_name):
    website = 'https://www.{}.com'.format(company_name)
    designers = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Mary Jane', 'James Bond']
    return website, designers

with app.app_context():
    db.create_all()

@app.route('/search_jobs', methods=['POST'])
def search_jobs():
    data = request.json
    role_title = data.get('role')
    industry_type = data.get('industry')
    location_city = data.get('location')
    
    # search for jobs from the database
    jobs = Role.query \
        .join(Company) \
        .join(Location) \
        .filter(
            Role.title.ilike(f'%{role_title}%'),
            Company.industry.ilike(f'%{industry_type}%'),
            Location.city.ilike(f'%{location_city}%')
        ).all()
    
    companies_details = [get_company_details(job.company.name) for job in jobs]

    # initialize the ai message
    ai_message = "Okay, you should apply to {}. Here are links to their websites, with the product design roles. ".format(", ".join([job.company.name for job in jobs]))
    joblistmsg = ''
    
    for company, details in zip(jobs, companies_details):
        website_url, designers_list = details
        # ai_message += "For {}, here is the website: {}. ".format(company.company.name, website_url)
        # ai_message += "Here are 5 designers at each of these companies, "

    ai_message += "Here are 5 designers at each of these companies, which I have added these to a list called Design Job Search. Would you like me to send emails to these people, mentioning your interest in the position?"

    
    response_data = {
        'ai_message': ai_message,
        'jobs_data': [{
            'title': job.title,
            'company': job.company.name,
            'industry': job.company.industry,
            'city': job.company.location.city,
            'website': 'https://www.{}.com'.format(job.company.name),
            'designers': details[1]
        } for job in jobs],
        'designers': details[1]
    }
    
    return jsonify(response_data)

@app.route('/create_emails', methods=['POST'])
def create_emails():
    data = request.json
    email_template = data.get('email_template')
    designers = data.get('designers')
    
    # file path
    filename = "personalized_emails.pdf"
    file_path = os.path.join(reports_dir, filename)

    # create the pdf file
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # overwrite for every designer
    y_position = height - 40  # begin position
    for designer in designers:
        personalized_email = email_template.replace('Ben', designer.split(' ')[0])
        pdf.drawString(40, y_position, personalized_email)
        y_position -= 40  # next position
    pdf.save()
    
    report_url = f"http://{request.host}/reports/{os.path.basename(file_path)}"

    # store the download url
    return jsonify({
        'report_url': report_url
    })

@app.route('/reports/<filename>')
def report(filename):
    return send_from_directory(reports_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
