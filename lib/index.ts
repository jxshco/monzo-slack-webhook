import { APIGatewayEvent } from "aws-lambda";
import { Handler } from "aws-sdk/clients/lambda";
import axios from "axios";

// @ts-ignore
const handleMonzoWebhook: Handler = async (
    event: APIGatewayEvent,
) => {
    try {
        const jsonData = JSON.parse(String(event.body)) as any;

        const type = jsonData?.type;

        switch (type) {
            case 'transaction.created': {
                await axios.post(String(process.env.SLACK_WEBHOOK_URL), {
                    "text": `:moneybag: New Monzo Transaction: ${Intl.NumberFormat('en-gb', { style: 'currency', currency: jsonData.data.currency}).format(jsonData.data.amount/100)} at ${jsonData.data.merchant.name}`,
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `:moneybag: New Monzo Transaction: ${Intl.NumberFormat('en-gb', { style: 'currency', currency: jsonData.data.currency}).format(jsonData.data.amount/100)} at ${jsonData.data.merchant.name}`
                            }
                        },
                        {
                            "type": "section",
                            "fields": [
                                {
                                    "type": "mrkdwn",
                                    "text": `*ID:*\n${jsonData?.data?.id || 'N/A'}`
                                },
                                {
                                    "type": "mrkdwn",
                                    "text": `*Description:*\n${jsonData?.data?.description || 'N/A'}`
                                },
                                {
                                    "type": "mrkdwn",
                                    "text": `*Category:*\n${jsonData?.data?.category || 'N/A'}`
                                },
                                {
                                    "type": "mrkdwn",
                                    "text": `*Merchant Address:*\n${jsonData?.data?.merchant?.address?.address || 'N/A'}, ${jsonData?.data?.merchant?.address?.city || 'N/A'}, ${jsonData?.data?.merchant?.address?.postcode || 'N/A'}`
                                }
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
            }
        }

        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            statusCode: 200,
            body: JSON.stringify({})
        }
    } catch (error) {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            statusCode: 500,
            body: JSON.stringify({
                message: 'An error occurred',
            }),
        };
    }
}

export default handleMonzoWebhook;
