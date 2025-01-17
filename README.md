# czech-anonymization
Anonymizes any Czech text by removing names, social security numbers, phone numbers, emails and other.

Everything runs locally. Behind the scenes it uses the nametag3 NER: https://github.com/ufal/nametag3

## Running this
    git clone https://github.com/ZykaJiri/czech-anonymization.git
    cd czech-anonymization
    docker compose up -d

## Usage
    curl -X POST http://localhost:3000/anonymize -H "Content-Type: application/json" -d '{"text": "Hello John Doe, your email is john@example.com. Jméno: Jan Novák, další email: zyka@testemail.cz"}' | jq

## Example output
    {
        "anonymizedText": "Hello <FIRST_NAME_#1> <LAST_NAME_#1>, your email is <EMAIL_#1>. Jméno: <FIRST_NAME_#2> <LAST_NAME_#2>, další email: <EMAIL_#2>",
        "changes": [
            {
            "changedTextInAnonymizedText": "John",
            "originalTagName": "<FIRST_NAME_#%index%>",
            "tagNameWithId": "<FIRST_NAME_#1>"
            },
            {
            "changedTextInAnonymizedText": "Doe",
            "originalTagName": "<LAST_NAME_#%index%>",
            "tagNameWithId": "<LAST_NAME_#1>"
            },
            {
            "changedTextInAnonymizedText": "john@example.com",
            "originalTagName": "<EMAIL_#%index%>",
            "tagNameWithId": "<EMAIL_#1>"
            },
            {
            "changedTextInAnonymizedText": "Jan",
            "originalTagName": "<FIRST_NAME_#%index%>",
            "tagNameWithId": "<FIRST_NAME_#2>"
            },
            {
            "changedTextInAnonymizedText": "Novák",
            "originalTagName": "<LAST_NAME_#%index%>",
            "tagNameWithId": "<LAST_NAME_#2>"
            },
            {
            "changedTextInAnonymizedText": "zyka@testemail.cz",
            "originalTagName": "<EMAIL_#%index%>",
            "tagNameWithId": "<EMAIL_#2>"
            }
        ]
    }
