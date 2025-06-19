package handlers

import (
	"context"
	"log"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"firebase.google.com/go/messaging"
	"google.golang.org/api/option"
)

var FirebaseAuthClient *auth.Client
var FirebaseMessagingClient *messaging.Client

func InitFirebase() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("serviceAccountKey.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error initializing Firebase app: %v", err)
	}

	FirebaseAuthClient, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error getting Auth client: %v", err)
	}

	FirebaseMessagingClient, err = app.Messaging(ctx)
	if err != nil {
		log.Fatalf("Error getting Messaging client: %v", err)
	}
}
func SendPush(token, title, body string) error {
	msg := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Token: token,
	}

	_, err := FirebaseMessagingClient.Send(context.Background(), msg)
	return err
}
