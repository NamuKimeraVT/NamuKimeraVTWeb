from flask import Flask, request, jsonify
from flask_cors import CORS  # Instala con: pip install flask-cors
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)  # Permite que tu frontend HTML se comunique con el backend

@app.route('/enviar-formulario', methods=['POST'])
def enviar_correo():
    # 1. Obtener los datos enviados desde el frontend
    datos = request.json
    nombre = datos.get('nombre')
    correo_usuario = datos.get('correo')
    mensaje = datos.get('mensaje')

    # 2. Configurar los datos de tu correo electrónico
    mi_correo = "namuquimera@gmail.com"
    mi_contrasena = "mekbvgcmvuwexzlv"  # No es tu clave normal, ver nota abajo

    # 3. Estructurar el mensaje que vas a recibir
    asunto = f"Nuevo mensaje de contacto de {nombre}"
    cuerpo = f"Nombre: {nombre}\nCorreo: {correo_usuario}\nMensaje:\n{mensaje}"
    
    msg = MIMEText(cuerpo)
    msg['Subject'] = asunto
    msg['From'] = mi_correo
    msg['To'] = mi_correo

    # 4. Conectar al servidor SMTP (Ejemplo con Gmail)
    try:
        server = smtplib.SMTP('://gmail.com', 587)
        server.starttls()  # Conexión segura
        server.login(mi_correo, mi_contrasena)
        server.sendmail(mi_correo, mi_correo, msg.as_string())
        server.quit()
        
        return jsonify({"status": "success", "message": "¡Correo enviado con éxito!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)