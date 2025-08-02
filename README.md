Contollers -
Auth
Openai

main services -
GmailService
GoogleDrive
Auth
UserState (storage)
Openai

Flow -
AUTH ->
Generate URL for Google login
Obtain access token
Store in localStorage using email as key (Email,JWT)

UI → OPENAI
The user asks a question
OpenAI returns a structured JSON based on the relevant service

exemple -
{
"googleDrive": {
"filters": {
"orderBy": "modifiedTime desc",
"pageSize": 5
},
"fields": ["id", "name", "mimeType", "modifiedTime"]
}
}

OPENAI → SERVICE
The structured query is sent to the appropriate service:
GMAIL SERVICE
GOOGLE DRIVE SERVICE

auth -> geturl (create code by google)-> reddirect func to create accesstoken -> jenerate jwt token -> return to client

openai get data by query -> auth by middleware -> generate json by openai -> schema check zod -> loop on mapping providers -> get data from services

NEET TO THINK -
1.ON SERCHAI RETURN THE PARSED OBJ TO THE UI
AND THEN THE CLIENT WILL TO THE REQ
2.PUT THE STORE OUTSIDE IN SERVICE (PAGINIATION)
3.GENERAL GOOGLE AND GMAILS SERVICE DO ONLY ONE FUNC?
4.Error in one service

TODO -
-storage in redis
-prompt isnt good enough
-ui filters?
-test
-gmail google queries
