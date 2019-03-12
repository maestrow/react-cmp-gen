import minimist from 'minimist'; 
import fs, { write } from 'fs';
import path from 'path';

// === Utils

const upperCaseFirst = (s) => s[0].toUpperCase() + s.slice(1);

const kebabToPascalCase = (kebab) => {
    const parts = kebab.split('-');
    return parts.map((i) => upperCaseFirst(i)).join('');
}

const writeFiles = (content) => {
    Object.keys(content).forEach((p) => {
        fs.writeFileSync(p, content[p]);
    });
}

// === Templates

const getTsx = (options) => {
    const { names } = options;
    return `
import * as React from 'react';
import * as cn from 'classnames';
import * as s from './${names.kebab}.pcss';

export interface I${names.pascal}Props {
  className?: string;
}

export class ${names.pascal} extends React.Component<I${names.pascal}Props, never> {
  public render() {
    const p = this.props;
    return (
      <div className={cn(s.root, p.className)}>
        ${names.pascal}
      </div>
    );
  }
}
`.replace(/^\n/g, '');
}

const getPcss = (options) => {
    const { names } = options;
    return `
.root {

}
    `.replace(/^\n/g, '').trimRight();
}

const getReadme = (options) => {
    const { names } = options;
    return `
    <${names.pascal} />
    `.trimRight();
}

// === Methods

const createComponentContent = (options) => {
    const { cmpPath, name } = options;
    const names = {
        kebab: name,
        pascal: kebabToPascalCase(name)
    }

    const content = {};
    content[path.join(cmpPath, `${names.kebab}.tsx`)] = getTsx({names});
    content[path.join(cmpPath, `${names.kebab}.pcss`)] = getPcss({names});
    content[path.join(cmpPath, `readme.md`)] = getReadme({names});
    return content;
}

// === Program

const args = minimist(process.argv.slice(2));
console.dir(args);
const command = args._[0]
console.log(process.cwd());
console.log(args.type);
console.log(args.name);

const cmpPath = path.join(process.cwd(), 'src', 'components', args.type, args.name);

if (!fs.existsSync(cmpPath)) {
    fs.mkdirSync(cmpPath);
}

const content = createComponentContent({ cmpPath, name: args.name });

if (args.d) {
    console.dir(content);
} else {
    writeFiles(content);
}
