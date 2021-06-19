import {
  blankNode, literal, namedNode, quad,
} from '@rdfjs/data-model';
import {
  getSafeData, getSafePropertyEntries, getSafePropertyEntry, getSafeTerm,
} from '../../lib/utils/get-safe-term';

describe('Testing error throwing behavior', () => {
  it('Should throw error when term is undefined in getSafeTerm', () => {
    expect(() => getSafeTerm(undefined)).toThrow(
      new Error('Expected term to be BlankNode, NamedNode or Literal. Recieved: undefined'),
    );
  });
  it('Should throw error when term is undefined in getSafeData', () => {
    expect(() => getSafeData({
      term: undefined,
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    })).toThrow(
      new Error('Expected term to be BlankNode, NamedNode or Literal. Recieved: undefined'),
    );
    expect(() => getSafeData({
      term: undefined,
      annotations: [],
    })).toThrow(
      new Error('Expected term to be BlankNode, NamedNode or Literal. Recieved: undefined'),
    );
  });
});

describe('Testing cases where bindings are valid', () => {
  it('Should maintain defined terms in getSafeTerm', () => {
    expect(getSafeTerm(namedNode('http://example.org#Jesse')))
      .toStrictEqual(namedNode('http://example.org#Jesse'));
    expect(getSafeTerm(blankNode('http://example.org#Jesse')))
      .toStrictEqual(blankNode('http://example.org#Jesse'));
    expect(getSafeTerm(literal('http://example.org#Jesse')))
      .toStrictEqual(literal('http://example.org#Jesse'));
    expect(getSafeTerm(literal('http://example.org#Jesse')))
      .toStrictEqual(literal('http://example.org#Jesse'));
    expect(getSafeTerm(literal('http://example.org#Jesse', 'en')))
      .toStrictEqual(literal('http://example.org#Jesse', 'en'));
  });
  it('Not have equality no equal terms with one passed through get safe term', () => {
    expect(getSafeTerm(namedNode('http://example.org#Jesse')))
      .not.toStrictEqual(blankNode('http://example.org#Jesse'));
    expect(getSafeTerm(blankNode('http://example.org#Jesse')))
      .not.toStrictEqual(literal('http://example.org#Jesse'));
    expect(getSafeTerm(literal('http://example.org#Jesse')))
      .not.toStrictEqual(literal('http://example.org#Jesse', 'en'));
    expect(getSafeTerm(literal('http://example.org#Jesse')))
      .not.toStrictEqual(
        literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
      );
    expect(getSafeTerm(literal('http://example.org#Jesse', 'en')))
      .not.toStrictEqual(
        literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
      );
  });
  it('Should maintain defined terms in getSafeData', () => {
    expect(getSafeData({
      term: namedNode('http://example.org#Jesse'),
      annotations: [],
    })).toStrictEqual({
      term: namedNode('http://example.org#Jesse'),
      annotations: [],
    });
    expect(getSafeData({
      term: blankNode('http://example.org#Jesse'),
      annotations: [],
    })).toStrictEqual({
      term: blankNode('http://example.org#Jesse'),
      annotations: [],
    });
    expect(getSafeData({
      term: literal('http://example.org#Jesse'),
      annotations: [],
    })).toStrictEqual({
      term: literal('http://example.org#Jesse'),
      annotations: [],
    });
    //
    expect(getSafeData({
      term: namedNode('http://example.org#Jesse'),
      annotations: [
        quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
    })).toStrictEqual({
      term: namedNode('http://example.org#Jesse'),
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    });
    expect(getSafeData({
      term: blankNode('http://example.org#Jesse'),
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    })).toStrictEqual({
      term: blankNode('http://example.org#Jesse'),
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    });
    expect(getSafeData({
      term: literal('http://example.org#Jesse'),
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    })).toStrictEqual({
      term: literal('http://example.org#Jesse'),
      annotations: [quad(
        namedNode('http://example.org#Jesse'),
        namedNode('http://example.org#type'),
        namedNode('http://example.org#Person'),
      )],
    });
  });
  it('Not have equality no equal terms with one passed through get safe term', () => {
    expect(getSafeData({
      term: namedNode('http://example.org#Jesse'),
      annotations: [],
    }))
      .not.toStrictEqual({
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      });
    expect(getSafeData({
      term: blankNode('http://example.org#Jesse'),
      annotations: [],
    }))
      .not.toStrictEqual({
        term: literal('http://example.org#Jesse'),
        annotations: [],
      });
    expect(getSafeData({
      term: literal('http://example.org#Jesse'),
      annotations: [],
    }))
      .not.toStrictEqual({
        term: literal('http://example.org#Jesse', 'en'),
        annotations: [],
      });
    expect(getSafeData({
      term: literal('http://example.org#Jesse'),
      annotations: [],
    }))
      .not.toStrictEqual(
        {
          term: literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
          annotations: [],
        },
      );
    expect(getSafeData({
      term: literal('http://example.org#Jesse', 'en'),
      annotations: [],
    }))
      .not.toStrictEqual(
        {
          term: literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
          annotations: [],
        },
      );
  });

  it('Should maintain defined terms in getSafePropertyEntry', () => {
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [],
      },
    });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      },
    });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    });
    //
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [
          quad(
            namedNode('http://example.org#Jesse'),
            namedNode('http://example.org#type'),
            namedNode('http://example.org#Person'),
          )],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    })).toStrictEqual({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    });
  });
  it('Not have equality no equal terms with one passed through get safe term', () => {
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [],
      },
    }))
      .not.toStrictEqual({
        valid: true,
        qualifiedEnforced: true,
        qualifiedValid: true,
        preloaded: false,
        key: 1,
        data: {
          term: blankNode('http://example.org#Jesse'),
          annotations: [],
        },
      });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      },
    }))
      .not.toStrictEqual({
        valid: true,
        qualifiedEnforced: true,
        qualifiedValid: true,
        preloaded: false,
        key: 1,
        data: {
          term: literal('http://example.org#Jesse'),
          annotations: [],
        },
      });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    }))
      .not.toStrictEqual({
        valid: true,
        qualifiedEnforced: true,
        qualifiedValid: true,
        preloaded: false,
        key: 1,
        data: {
          term: literal('http://example.org#Jesse', 'en'),
          annotations: [],
        },
      });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    }))
      .not.toStrictEqual({
        valid: true,
        qualifiedEnforced: true,
        qualifiedValid: true,
        preloaded: false,
        key: 1,
        data:
        {
          term: literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
          annotations: [],
        },
      });
    expect(getSafePropertyEntry({
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse', 'en'),
        annotations: [],
      },
    }))
      .not.toStrictEqual({
        valid: true,
        qualifiedEnforced: true,
        qualifiedValid: true,
        preloaded: false,
        key: 1,
        data:
        {
          term: literal('http://example.org#Jesse', namedNode('http://example.org#Datatype')),
          annotations: [],
        },
      });
  });
  it('Should maintain defined terms in getSafePropertyEntries', () => {
    expect(getSafePropertyEntries([{
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [
          quad(
            namedNode('http://example.org#Jesse'),
            namedNode('http://example.org#type'),
            namedNode('http://example.org#Person'),
          )],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    }])).toStrictEqual([{
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: blankNode('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    }, {
      valid: true,
      qualifiedEnforced: true,
      qualifiedValid: true,
      preloaded: false,
      key: 1,
      data: {
        term: literal('http://example.org#Jesse'),
        annotations: [quad(
          namedNode('http://example.org#Jesse'),
          namedNode('http://example.org#type'),
          namedNode('http://example.org#Person'),
        )],
      },
    }]);
  });
});
