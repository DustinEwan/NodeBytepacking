
/*
------------------------------------------
SERIALIZATION BUILDER
------------------------------------------
*/

export enum Types {
    String,
    Float,
    Double,
    Int8,
    Int16,
    Int32,
    UInt8,
    UInt16,
    UInt32,
    Boolean
}

let TYPE_LENGTH_MAP = {}
TYPE_LENGTH_MAP[Types.String] = -1;
TYPE_LENGTH_MAP[Types.Float] = 4;
TYPE_LENGTH_MAP[Types.Double] = 8;
TYPE_LENGTH_MAP[Types.Int8] = 1;
TYPE_LENGTH_MAP[Types.Int16] = 2;
TYPE_LENGTH_MAP[Types.Int32] = 4;
TYPE_LENGTH_MAP[Types.UInt8] = 1;
TYPE_LENGTH_MAP[Types.UInt16] = 2;
TYPE_LENGTH_MAP[Types.UInt32] = 4;
TYPE_LENGTH_MAP[Types.Boolean] = 1;

export interface PropertyEntry {
    name: string
    propertyType: Types
    length: number
}

export class Struct<TObject> {    
    private properties: PropertyEntry[];

    constructor() {
        this.properties = [];
    }

    private addProperty(name: string, type: Types, length?: number): Struct<TObject> {
        length = length || TYPE_LENGTH_MAP[type];

        this.properties.push({
            name,
            propertyType: type,
            length 
        });

        return this;
    }

    String(name: string, length: number): Struct<TObject> {
        return this.addProperty(name, Types.String, length);
    }

    Float(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Float);
    }

    Double(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Double);
    }

    Int8(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int8);
    }

    Int16(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int16);
    }

    Int32(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int32);
    }

    UInt8(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int8);
    }

    UInt16(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int16);
    }

    UInt32(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Int32);
    }

    Boolean(name: string): Struct<TObject> {
        return this.addProperty(name, Types.Boolean);
    }

    Build(): StructSerializer<TObject> {
        return new StructSerializer<TObject>(this.properties);
    }
}

export class StructSerializer<TObject> {
    private buffer: Buffer;
    private properties: PropertyEntry[];

    constructor(identifier: number, properties: PropertyEntry[]) {
        let length = properties.map((prop) => prop.length).reduce((previous, current) => previous + current, 0);
        this.buffer = Buffer.allocUnsafe(length + 1);
        this.writeBufferEntry(Types.UInt8, identifier, 0);
        this.properties = properties;
    }       

    private writeBufferEntry(type: Types, value: any, offset: number, length?: number) {
        switch(type) {
            case Types.String:
                this.buffer.write(value, offset, length, 'utf8');
                break;
            case Types.Float:
                this.buffer.writeFloatLE(value, offset);
                break;
            case Types.Double:
                this.buffer.writeDoubleLE(value, offset);
                break;
            case Types.Int8:
                this.buffer.writeInt8(value, offset);
                break;
            case Types.Int16:
                this.buffer.writeInt16LE(value, offset);
                break;
            case Types.Int32:
                this.buffer.writeInt32LE(value, offset);
                break;
            case Types.UInt16:
                this.buffer.writeUInt16LE(value, offset);
                break;
            case Types.UInt32:
                this.buffer.writeUInt32LE(value, offset);
                break;
            case Types.Boolean:
            case Types.UInt8:
                this.buffer.writeUInt8(value, offset);
                break;
        }
    }

    private readBufferEntry(type: Types, offset: number, length?: number): any {
        switch(type) {
            case Types.String:
                let string = this.buffer.toString('utf8', offset, offset + length);
                return string.substr(0, string.indexOf('\u0000'));
            case Types.Float:
                return this.buffer.readFloatLE(offset);
            case Types.Double:
                return this.buffer.readDoubleLE(offset);
            case Types.Int8:
                return this.buffer.readInt8(offset);
            case Types.Int16:
                return this.buffer.readInt16LE(offset);
            case Types.Int32:
                return this.buffer.readInt32LE(offset);
            case Types.UInt16:
                return this.buffer.readUInt16LE(offset);
            case Types.UInt32:
                return this.buffer.readUInt32LE(offset);
            case Types.Boolean:
            case Types.UInt8:
                return this.buffer.readUInt8(offset);
        }
    }

    Serialize(object: TObject): Buffer {
        let index: number = 1;
        this.properties.forEach((prop) => {
            let value = object[prop.name];
            this.writeBufferEntry(prop.propertyType, value, index, prop.length);
            index += prop.length;
        });

        return this.buffer;
    }

    Deserialize(buffer: Buffer): TObject {
        let instance: any = {};

        let index: number = 1;
        this.properties.forEach((prop) => {
            let value = this.readBufferEntry(prop.propertyType, index, prop.length);
            instance[prop.name] = value;
            index += prop.length;
        });

        return instance;
    }
}

export class StructDemarshaller {

    private _serializerMap: { [key: number]: StructSerializer<any> };

    Register<TObject>(index: number, serializer: StructSerializer<TObject>) {
        this._serializerMap[index] = serializer;
    }

    Demarshall<TObject>(buffer: Buffer)<TObject> {
        let type = buffer.readUInt8(0);
        return this._serializerMap[type].Deserialize(buffer);
    }
}