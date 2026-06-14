import "dotenv/config";

const getAIResponse = async (messages, model = 'gpt-4o-mini') => {
    const input = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model, input }),
    };

    try {
        const response = await fetch('https://api.openai.com/v1/responses', options);
        const data = await response.json();
        return data.output[0].content[0].text;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export default getAIResponse;
