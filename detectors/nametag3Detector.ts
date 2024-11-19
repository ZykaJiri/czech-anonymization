import axios from 'axios';
import {AbstractDetector, AnonymizedChange, AnonymizedResult} from './abstractDetector';
import { XMLParser } from 'fast-xml-parser';

interface TypesToTags {
    [key: string]: string;
}

interface TagCounters {
    [key: string]: number;
}

export class Nametag3Detector extends AbstractDetector {
    private baseUrl = "http://localhost:8001/recognize";
    private tagCounters: TagCounters = {};

    private typesToTags: TypesToTags = {
        "pf": this.FIRST_NAME_TAG_NAME,
        "ps": this.LAST_NAME_TAG_NAME,
        "ah": this.ADDRESS_TAG_NAME,
        "at": this.PHONE_TAG_NAME,
        "me": this.EMAIL_TAG_NAME,
        "gu": this.PERSON_TITLE_TAG_NAME,
    };

    public async anonymize(data: string): Promise<AnonymizedResult> {
        const xmlString = await this.getResponseFromNametag3(data);
        this.tagCounters = {};

        const { anonymizedText, changes } = await this.processXml(xmlString);
        return {
            anonymizedText,
            anonymizedChanges: changes
        };
    }

    private async getResponseFromNametag3(data: string): Promise<string> {
        const response = await axios.get(this.baseUrl, {
            params: { data }
        });

        if (response.status !== 200) {
            throw new Error(`Failed to fetch data. HTTP Status Code: ${response.status}`);
        }

        const cleanedXml = response.data.result
            .replaceAll(/\\"/g, '"')
            .replaceAll(/\\n/g, '<newline></newline>')
            .replaceAll(/\n/g, '<newline></newline>')
            .replaceAll('<sentence>', '')
            .replaceAll('</sentence>', '')
            .replaceAll('> ', '><whitespace></whitespace>') // Replaces whitespace between tags

        return `${cleanedXml}`;
    }

    private async processXml(cleanXml: any): Promise<{ anonymizedText: string; changes: AnonymizedChange[] }> {
        let cleanedText = '';
        const changes: AnonymizedChange[] = [];

        const parser = new XMLParser({
            preserveOrder: true,
            ignoreAttributes: false
        });
        let jObj: any[] = parser.parse(cleanXml);

        function getTokenText(documentPart: any) {
            let tokenText = '';
            const tokens = documentPart['token'];
            tokens.forEach((tokenPart: { [x: string]: string; }) => {
                tokenText += tokenPart['#text'];
            });
            return tokenText;
        }

        const that = this;

        function processXml(documentPart: any) {
            if (documentPart instanceof Array) {
                for (const part of documentPart) {
                    processXml(part);
                }
                return;
            }

            const partKeys = Object.keys(documentPart);
            // Token is pure text so we can just add it to the cleaned text
            if (partKeys.includes('token')) {
                cleanedText += getTokenText(documentPart);
                return;
            }

            // NamedEntity may be some kind of personal data, in this case it's a combination of multiple NEs
            if (partKeys.includes('ne') && documentPart['ne'].some((ne: any) => Object.keys(ne).includes('ne'))) {
                processXml(documentPart.ne);
                return;
            }

            if (partKeys.includes('newline')) {
                cleanedText += '\n';
                return;
            }

            if (partKeys.includes('whitespace')) {
                cleanedText += ' ';
                return;
            }

            // Unwanted detected named entities
            const neDocumentPart = documentPart['ne']
            const neType = documentPart[':@']['@_type'];
            if (!Object.keys(that.typesToTags).includes(neType)) {
                processXml(neDocumentPart);
                return;
            }

            // Process a single NamedEntity
            const tagName = that.typesToTags[neType];

            if (that.tagCounters[tagName] === undefined) {
                that.tagCounters[tagName] = 1;
            } else {
                that.tagCounters[tagName]++;
            }

            const tagNameWithId = that.getFullTagName(tagName, that.tagCounters[tagName]);
            changes.push({
                changedTextInAnonymizedText: getTokenText(neDocumentPart[0]),
                originalTagName: that.typesToTags[neType],
                tagNameWithId: tagNameWithId
            });

            cleanedText += tagNameWithId;
        }
        processXml(jObj);

        return {
            anonymizedText: cleanedText.trim(),
            changes
        };
    }
}