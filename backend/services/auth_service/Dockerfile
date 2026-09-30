FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY auth ./auth
COPY services/auth_service/app.py ./app.py

EXPOSE 5001

CMD ["python", "app.py"]
