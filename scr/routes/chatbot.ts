// chatbot.ts

import { Request, Response } from 'express';

export function getInitialMessage(): string {
    return "Hola, soy tu Chatbot. Por favor, elige una opción:\n" +
           "1. Como se agenda una cita.\n" +
           "2. Como modifico una cita.\n" +
           "3. No me aparecen ninguna nota después de agendar una cita.\n" +
           "4. ¿Puedo cancelar una o más citas?.\n" +
           "5. ¡Puse información errónea! ¿Qué hago.";
}

export function processMessage(userInput: string): string {
    switch (userInput) {
        case '1':
            return "a.";
        case '2':
            return "a.";
        case '3':
            return "a.";
        case '4':
            return "a.";
        case '5':
            return "a.";
        default:
            return "Lo siento, no entendí eso. Por favor, elige una opción entre 1 y 5.";
    }
}

export default function handler(req: Request, res: Response): void {
    if (req.method === 'POST') {
        const { message } = req.body;
        const response = processMessage(message);
        res.status(200).json({ response });
    } else {
        res.status(200).json({ response: getInitialMessage() });
    }
}
