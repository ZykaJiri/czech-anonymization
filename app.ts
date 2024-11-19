import express from 'express';
import { AbstractDetector, AnonymizedChange } from './detectors/abstractDetector';
import { Nametag3Detector } from './detectors/nametag3Detector';
import { CzechRegexDetector } from './detectors/czechRegexDetector';

const app = express();
app.use(express.json());

interface CombinedAnonymizedResult {
    anonymizedText: string;
    changes: AnonymizedChange[];
}

class AnonymizationService {
    private detectors: AbstractDetector[] = [];

    constructor() {
        this.loadDetectors();
    }

    private loadDetectors() {
        this.detectors.push(new CzechRegexDetector());
        this.detectors.push(new Nametag3Detector())
    }

    async anonymizeText(text: string): Promise<CombinedAnonymizedResult> {
        let currentText = text;
        let allChanges: AnonymizedChange[] = [];

        // Run each detector sequentially
        for (const detector of this.detectors) {
            try {
                const result = await detector.anonymize(currentText);
                currentText = result.anonymizedText;
                allChanges = allChanges.concat(result.anonymizedChanges);
            } catch (error) {
                console.error(`Error in detector ${detector.constructor.name}:`, error);
            }
        }

        return {
            anonymizedText: currentText,
            changes: allChanges,
        };
    }
}

const anonymizationService = new AnonymizationService();

app.post('/anonymize', async (req: any, res: any) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Missing or invalid text parameter',
            });
        }

        const result = await anonymizationService.anonymizeText(text);
        res.json(result);
    } catch (error) {
        console.error('Error processing anonymization request:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;