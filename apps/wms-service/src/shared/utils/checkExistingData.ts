import { Model, ModelStatic, WhereOptions } from 'sequelize';

export async function checkExistingData(
  model: ModelStatic<Model<any, any>>,
  id: string | number,
): Promise<Model<any, any> | null> {
  const data = await model.findByPk(id);
  if (!data) {
    console.error(`Data with ID ${id} not found`);
    return null;
  } else {
    return data;
  }
}

export async function checkExistingDataWithColumn(
  model: ModelStatic<Model<any, any>>,
  id: string | number,
  column: string,
): Promise<Model<any, any> | null> {
  const data = await model.findOne({ where: { [column]: id } });
  if (!data) {
    console.error(`Data with ID ${id} not found`);
    return null;
  } else {
    console.log('Data retrieved successfully:', data);
    return data;
  }
}

export async function checkExistingOneData(
  model: ModelStatic<Model<any, any>>,
): Promise<Model<any, any> | null> {
  const data = await model.findOne();
  if (!data) {
    console.error(`Data not found`);
    return null;
  } else {
    console.log('Data retrieved successfully:', data);
    return data;
  }
}

export async function checkAllExistingDataWithColumn(
  model: ModelStatic<Model<any, any>>,
  id: string | number,
  column: string,
): Promise<Model<any, any>[] | null> {
  const data = await model.findAll({ where: { [column]: id } });
  if (!data) {
    console.error(`Data with ID ${id} not found`);
    return null;
  } else {
    console.log('Data retrieved successfully:', data);
    return data;
  }
}

export async function checkExistingDataWithJoin(
  mainModel: ModelStatic<Model<any, any>>,
  relationModel: ModelStatic<Model<any, any>>,
  attributes: string[],
  as: string,
  required: boolean | undefined,
  id: string | number,
): Promise<Model<any, any> | null> {
  const data = await mainModel.findByPk(id, {
    include: [
      {
        model: relationModel,
        as: as,
        required: required ? required : false,
        attributes: attributes,
      },
    ],
  });
  if (!data) {
    console.error(`Data with ID ${id} not found`);
    return null;
  } else {
    console.log('Data retrieved successfully:', data);
    return data;
  }
}

export async function checkExistingDataWithJoinMoreThanOne(
  mainModel: ModelStatic<Model<any, any>>,
  options: {
    relation1: {
      model: ModelStatic<Model<any, any>>;
      as: string;
      attributes?: string[];
      required?: boolean;
      where?: any;
      through?: { attributes: string[] };
    };
    relation2?: {
      model: ModelStatic<Model<any, any>>;
      as: string;
      attributes?: string[];
      required?: boolean;
      where?: any;
      through?: { attributes: string[] };
    };
    relation3?: {
      model: ModelStatic<Model<any, any>>;
      as: string;
      attributes?: string[];
      required?: boolean;
      where?: any;
      through?: { attributes: string[] };
    };
    includeMainAttributes?: string[];
    paranoid?: boolean;
  },
  id: string | number,
): Promise<Model<any, any> | null> {
  try {
    const include = [
      {
        model: options.relation1.model,
        as: options.relation1.as,
        attributes: options.relation1.attributes,
        required: options.relation1.required ?? true,
        where: options.relation1.where,
        through: options.relation1.through,
      },
    ];

    if (options.relation2) {
      include.push({
        model: options.relation2.model,
        as: options.relation2.as,
        attributes: options.relation2.attributes,
        required: options.relation2.required ?? true,
        where: options.relation2.where,
        through: options.relation2.through,
      });
    }

    if (options.relation3) {
      include.push({
        model: options.relation3.model,
        as: options.relation3.as,
        attributes: options.relation3.attributes,
        required: options.relation3.required ?? true,
        where: options.relation3.where,
        through: options.relation3.through,
      });
    }

    const data = await mainModel.findByPk(id, {
      attributes: options.includeMainAttributes,
      include,
      paranoid: options.paranoid ?? true,
    });

    if (!data) {
      console.error(`Data with ID ${id} not found`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in checkExistingDataWithJoinMoreThanOne:', error);
    throw error;
  }
}

export async function checkExistingDataWithColumns(
  model: ModelStatic<Model<any, any>>,
  whereClause: WhereOptions<any>,
): Promise<Model<any, any> | null> {
  const data = await model.findOne({ where: whereClause });

  if (!data) {
    console.error(`Data with criteria ${JSON.stringify(whereClause)} not found`);
    return null;
  } else {
    console.log('Data retrieved successfully:', data);
    return data;
  }
}

export async function getExistingIds(
  model: ModelStatic<Model<any, any>>,
  ids: (string | number)[],
): Promise<Set<string>> {
  const existingData = await model.findAll({
    attributes: ['id'],
    where: {
      id: ids,
    },
    raw: true,
  });

  return new Set(existingData.map((item: any) => item.id.toString()));
}
