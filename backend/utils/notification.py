import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'frontend', 'public', 'sanspace_logo.png'))
LOGO_CID = "logo_cid"

def _send_email(subject: str, text_body: str, html_body: str, to_email: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    message = MIMEMultipart("related")
    message["From"] = smtp_user
    message["To"] = to_email
    message["Subject"] = subject

    alternative_part = MIMEMultipart("alternative")
    message.attach(alternative_part)

    alternative_part.attach(MIMEText(text_body, "plain"))
    alternative_part.attach(MIMEText(html_body, "html"))

    with open(LOGO_PATH, "rb") as img_file:
        img = MIMEImage(img_file.read())
    img.add_header('Content-ID', f'<{LOGO_CID}>')
    img.add_header('Content-Disposition', 'inline', filename=os.path.basename(LOGO_PATH))
    message.attach(img)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(message)
        server.quit()
    except Exception as e:
        print("❌ Błąd podczas wysyłania maila:", e)

def _compose_html(room_name, date, time_from, time_to, title, message):
    return f"""
    <html>
      <body style="color: #030712; font-family: Arial, sans-serif; line-height:1.5;">
        <img src="cid:{LOGO_CID}" alt="Logo" width="120" />
        <h2 style="color: #2F0D68;">{title}</h2>
        <h3>{message}</h3>
        <p><strong>Sala:</strong> {room_name}<br/>
           <strong>Data:</strong> {date}<br/>
           <strong>Godziny:</strong> {time_from} - {time_to}</p>
        <p>Dziękujemy za skorzystanie z naszego systemu.</p>
      </body>
    </html>
    """

def send_reservation_created(to_email: str, room_name: str, date: str, time_from: str, time_to: str):
    subject = "Potwierdzenie rezerwacji sali"
    text_body = f"Rezerwacja sali {room_name} w godzinach {time_from}-{time_to} w dniu {date} przebiegła pomyślnie."
    html_body = _compose_html(
        room_name, date, time_from, time_to,
        title="Potwierdzenie rezerwacji",
        message="Twoja rezerwacja została pomyślnie zarejestrowana."
    )
    _send_email(subject, text_body, html_body, to_email)

def send_reservation_updated(to_email: str, room_name: str, date: str, time_from: str, time_to: str):
    subject = "Aktualizacja rezerwacji sali"
    text_body = f"Twoja rezerwacja sali {room_name} została zaktualizowana na godziny {time_from}-{time_to} w dniu {date}."
    html_body = _compose_html(
        room_name, date, time_from, time_to,
        title="Aktualizacja rezerwacji",
        message="Twoja rezerwacja została zmieniona."
    )
    _send_email(subject, text_body, html_body, to_email)

def send_reservation_cancelled(to_email: str, room_name: str, date: str, time_from: str, time_to: str):
    subject = "Anulowanie rezerwacji sali"
    text_body = f"Twoja rezerwacja sali {room_name} w godzinach {time_from}-{time_to} w dniu {date} została anulowana."
    html_body = _compose_html(
        room_name, date, time_from, time_to,
        title="Anulowanie rezerwacji",
        message="Twoja rezerwacja została anulowana."
    )
    _send_email(subject, text_body, html_body, to_email)
