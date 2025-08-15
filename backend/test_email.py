from flask import Flask, request, jsonify
import smtplib

app = Flask(__name__)

@app.route('/test_email', methods=['POST'])
def test_email():
    data = request.get_json()

    # Access email and password correctly by key names, not values
    zoho_email = data['email']
    zoho_password = data['password']
    recipient = data.get('recipient', zoho_email)  # default to sender

    subject = "SMTP Test"
    body = "Test email sent from Flask via Zoho SMTP."

    email_message = f"Subject: {subject}\n\n{body}"

    try:
        with smtplib.SMTP('smtp.zoho.com', 587) as server:
            server.starttls()
            server.login(zoho_email, zoho_password)
            server.sendmail(zoho_email, recipient, email_message)
        return jsonify({"status": "success", "message": "Email sent!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
