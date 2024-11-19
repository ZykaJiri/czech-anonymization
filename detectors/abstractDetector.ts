export interface AnonymizedChange {
    changedTextInAnonymizedText: string;
    originalTagName: string;
    tagNameWithId: string;
}

export interface AnonymizedResult {
    anonymizedText: string;
    anonymizedChanges: AnonymizedChange[];
}

export abstract class AbstractDetector {
    protected readonly FIRST_NAME_TAG_NAME = '<FIRST_NAME_#%index%>';
    protected readonly LAST_NAME_TAG_NAME = '<LAST_NAME_#%index%>';
    protected readonly EMAIL_TAG_NAME = '<EMAIL_#%index%>';
    protected readonly PHONE_TAG_NAME = '<PHONE_#%index%>';
    protected readonly ADDRESS_TAG_NAME = '<ADDRESS_#%index%>';
    protected readonly PERSONAL_ID_TAG_NAME = '<PERSONAL_ID_#%index%>';
    protected readonly PERSON_TITLE_TAG_NAME = '<PERSON_TITLE_#%index%>';
    abstract anonymize(data: string): Promise<AnonymizedResult>;

    protected getFullTagName(tagName: string, lastIndex: number): string {
        return tagName.replace('%index%', lastIndex.toString());
    }
}