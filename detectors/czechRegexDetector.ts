import {AbstractDetector, AnonymizedChange, AnonymizedResult} from "./abstractDetector";

export class CzechRegexDetector extends AbstractDetector {
    async anonymize(data: string): Promise<AnonymizedResult> {
        const czechAndSlovakBirthNumberRegex = /\b[0-9]{2}(?:[0257][1-9]|[1368][0-2])(?:0[1-9]|[12][0-9]|3[01])\/?[0-9]{3,4}\b/;
        const matches = data.match(czechAndSlovakBirthNumberRegex);
        if (!matches) {
            return {
                anonymizedText: data,
                anonymizedChanges: []
            };
        }

        const changes: AnonymizedChange[] = [];
        for (let [index, match] of matches.entries()) {
            const tagName = this.getFullTagName(this.PERSONAL_ID_TAG_NAME, index + 1);
            changes.push({
                changedTextInAnonymizedText: match,
                originalTagName: this.PERSONAL_ID_TAG_NAME,
                tagNameWithId: tagName
            });

            data = data.replace(match, tagName);
        }

        return {
            anonymizedText: data,
            anonymizedChanges: changes
        };
    }

}