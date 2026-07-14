type SerializableFields = readonly string[];

/**
 * Returns a toJSON.transform function that converts _id (ObjectId -> string)
 * and any listed Date fields (Date -> ISO string), so documents match the
 * shared Zod contract schemas when sent over the wire.
 */
export function serializeTimestamps(dateFields: SerializableFields = ['createdAt', 'updatedAt']) {
  return (_doc: unknown, ret: unknown) => {
    const json = ret as {
      _id: { toString: () => string } | string;
      [key: string]: unknown;
    };

    json._id = json._id.toString();

    for (const field of dateFields) {
      const value = json[field];
      if (value) {
        json[field] = new Date(value as string | Date).toISOString();
      }
    }

    return json;
  };
}
