import { getGroupProperty, getGroupCollection } from './get-group';
import type {
  FieldType, FieldEntries, GroupEntry, sh,
} from '../../types';

export function getFields(shacl: sh.NodeShape): FieldType[] {
  const groups: Record<string, GroupEntry> = {};
  const properties: FieldType[] = [];

  function addField(
    group: sh.NodeGroup | undefined,
    field: FieldEntries,
  ) {
    if (group) {
      if (`${group}` in groups) {
        groups[`${group}`].fields.push(field);
      } else {
        groups[`${group}`] = {
          type: 'group',
          value: field.value.group,
          fields: [field],
          parent: shacl,
        };
      }
    } else {
      properties.push(field);
    }
  }

  for (const property of shacl.sh$property) {
    addField(getGroupProperty(property), { type: 'property', value: property, parent: shacl });
  }
  for (const not of shacl.not) {
    addField(getGroupProperty(not), { type: 'not', value: not, parent: shacl });
  }
  for (const and of shacl.and) {
    addField(getGroupCollection(and), { type: 'and', value: and, parent: shacl });
  }
  for (const or of shacl.or) {
    addField(getGroupCollection(or), { type: 'or', value: or, parent: shacl });
  }
  for (const xone of shacl.xone) {
    addField(getGroupCollection(xone), { type: 'xone', value: xone, parent: shacl });
  }

  return [...properties, ...Object.values(groups)];
}
