import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app_dependencies import SENDER_EMAIL, SENDER_EMAIL_PASSWORD


sender_email = SENDER_EMAIL
password = SENDER_EMAIL_PASSWORD  


class send_code:

    def __init__(self, receiver):
        self.receiver = receiver
        pass

    
    def set_content(self, passcode: int, content = None, alt = None):
        self.HTML_CONTENT = f"""

        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Code</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1e1e1e;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #2c2c2c;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            }}
            .header {{
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 20px;
            }}
            .message {{
                font-size: 16px;
                color: #cccccc;
                margin-bottom: 30px;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #4fc3f7;
                text-align: center;
                letter-spacing: 8px;
                margin-bottom: 30px;
            }}
            .footer {{
                font-size: 14px;
                color: #aaaaaa;
                text-align: center;
            }}
            .button {{
                display: block;
                width: fit-content;
                margin: 0 auto 30px auto;
                background-color: #4fc3f7;
                color: #1e1e1e;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-weight: bold;
            }}
        </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Your Access Code</div>
                <div class="message">
                    Hello, <br><br>
                    {content}
                </div>
                <div class="code">{passcode}</div>
                <!-- <a href="#" class="button">Verify Now</a> -->
                <div class="footer">
                    {alt if alt else ''}
                </div>
            </div>
        </body>
        </html>

    """ 
        return self
        

    def send_this(self):
        message = MIMEMultipart("alternative")
        message["From"] = sender_email
        message["To"] = self.receiver
        message["Subject"] = 'Enter the passcode'

        message.attach(MIMEText(self.HTML_CONTENT, "html"))

        try:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465) 
            server.login(sender_email, password)
            server.sendmail(sender_email, self.receiver, message.as_string())
            server.quit()
            print("Email was sent!")
        except Exception as e:
            print("Something went wrong when sending an email --> ", e)









class send_share_notfification:

    def __init__(self, receiver):
        self.receiver = receiver
        pass

    
    def set_content(self, content = None, alt = None):
        self.HTML_CONTENT = f"""

        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Granted</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #1e1e1e;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #2c2c2c;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            }}
            .header {{
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 20px;
            }}
            .message {{
                font-size: 16px;
                color: #cccccc;
                margin-bottom: 30px;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #4fc3f7;
                text-align: center;
                letter-spacing: 8px;
                margin-bottom: 30px;
            }}
            .footer {{
                font-size: 14px;
                color: #aaaaaa;
                text-align: center;
            }}
            .button {{
                display: block;
                width: fit-content;
                margin: 0 auto 30px auto;
                background-color: #4fc3f7;
                color: #1e1e1e;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-weight: bold;
            }}
        </style>
        </head>
        <body>
            <div class="container">
                <div class="header">You have been added to a whitelist by an owner of a following resource: </div>
                <div class="message">
                    {content} 
                </div>
                <div class="footer">
                    {alt if alt else ''}
                </div>
            </div>
        </body>
        </html>

    """ 
        return self
        

    def send_this(self):
        message = MIMEMultipart("alternative")
        message["From"] = sender_email
        message["To"] = self.receiver
        message["Subject"] = 'A resource has been shared with you'

        message.attach(MIMEText(self.HTML_CONTENT, "html"))

        try:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465) 
            server.login(sender_email, password)
            server.sendmail(sender_email, self.receiver, message.as_string())
            server.quit()
            print("Email was sent!")
        except Exception as e:
            print("Something went wrong when sending an email --> ", e)


