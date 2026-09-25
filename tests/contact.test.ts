import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema } from '../src/features/contact/schema';
import { es } from '../src/i18n/es';
import { en } from '../src/i18n/en';
import { locales, routeMap, projectRoute } from '../src/i18n/routes';
import { projects } from '../src/data/projects';
const valid = {
  name: '  Ana Pérez  ',
  email: ' ana@example.com ',
  company: '',
  type: 'civil',
  message: 'Busco desarrollar un proyecto residencial.',
  consent: true,
};
for (const [locale, copy] of Object.entries({ es, en })) {
  const schema = contactSchema(copy.contact.errors);
  test(locale + ': valid input is normalized', () => {
    const data = schema.parse(valid);
    assert.equal(data.name, 'Ana Pérez');
    assert.equal(data.email, 'ana@example.com');
  });
  test(locale + ': invalid and oversized input is rejected', () => {
    for (const override of [
      { name: ' ' },
      { email: 'wrong' },
      { company: 'a'.repeat(151) },
      { type: 'invalid' },
      { message: 'short' },
      { message: 'x'.repeat(3001) },
      { consent: false },
    ])
      assert.equal(schema.safeParse({ ...valid, ...override }).success, false);
  });
  test(locale + ': localized correction messages', () => {
    const result = schema.safeParse({ ...valid, email: 'bad' });
    assert.equal(result.success, false);
    if (!result.success)
      assert.equal(result.error.issues[0].message, copy.contact.errors.email);
  });
}
test('all generated routes are unique and localized', () => {
  const routes = locales.flatMap((locale) => [
    ...Object.values(routeMap).map((r) => r[locale]),
    ...projects.map((p) => projectRoute(locale, p.slug)),
  ]);
  assert.equal(routes.length, 26);
  assert.ok(
    projects.every((project) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug),
    ),
  );
  assert.equal(new Set(routes).size, routes.length);
  assert.ok(routes.every((route) => route.endsWith('/')));
});
test('translation keys stay identical', () => {
  const keys = (o: object, p = ''): string[] =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v)
        ? keys(v, p + k + '.')
        : [p + k],
    );
  assert.deepEqual(keys(es), keys(en));
});
