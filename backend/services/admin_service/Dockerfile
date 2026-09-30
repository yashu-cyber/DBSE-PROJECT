FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY auth ./auth
COPY services/admin_service/app.py ./app.py

EXPOSE 5003

CMD ["python", "app.py"]
