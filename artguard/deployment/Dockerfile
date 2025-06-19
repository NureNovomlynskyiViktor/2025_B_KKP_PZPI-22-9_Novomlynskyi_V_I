FROM golang:1.24.3

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o artguard main.go

EXPOSE 3000

CMD ["./artguard"]

