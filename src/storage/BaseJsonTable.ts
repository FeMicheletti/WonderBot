import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export abstract class BaseJsonTable<TData> {
    protected readonly filePath: string;
    protected data: TData;

    constructor(filePath: string) {
        if (!filePath) throw new Error('filePath is required');
        this.filePath = filePath;
        this.ensureFile();
        this.data = this.read();
    }

    protected abstract getDefaultData(): TData;

    private ensureFile(): void {
        const folder = dirname(this.filePath);

        if (!existsSync(folder)) {
            mkdirSync(folder, { recursive: true });
        }

        if (!existsSync(this.filePath)) {
            const initialData = this.getDefaultData();
            writeFileSync(this.filePath, JSON.stringify(initialData, null, 2), 'utf-8');
        }
    }

    private read(): TData {
        const raw = readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw) as TData;
    }

    private persist(): void {
        writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    public getAll(): TData {
        return this.data;
    }

    public reload(): void {
        this.data = this.read();
    }

    public save(): void {
        this.persist();
    }

    public replace(data: TData): void {
        this.data = data;
        this.persist();
    }

    public update(mutator: (data: TData) => void): void {
        mutator(this.data);
        this.persist();
    }
}