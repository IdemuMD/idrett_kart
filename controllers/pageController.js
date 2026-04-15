const matchModel = require('../models/matchModel');
const fs = require('node:fs/promises');
const path = require('node:path');
const MarkdownIt = require('markdown-it');
const sanitizeHtml = require('sanitize-html');
const teamModel = require('../models/teamModel');
const tournamentModel = require('../models/tournamentModel');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  typographer: true,
});

const readmePath = path.join(__dirname, '..', 'README.md');

markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = (token.info || '').trim();

  if (info === 'mermaid') {
    return `<pre class="mermaid">${sanitizeHtml(token.content, { allowedTags: [], allowedAttributes: {} }).trim()}</pre>`;
  }

  return self.renderToken(tokens, idx, options);
};

async function home(req, res) {
  const [tournaments, teams, matches] = await Promise.all([
    tournamentModel.listSimple(),
    teamModel.list(),
    matchModel.list(),
  ]);

  return res.render('index', {
    matches,
    pageTitle: 'Idrettskart - Turneringssystem',
    success: req.query.success || '',
    teams,
    tournaments,
    error: req.query.error || '',
  });
}

async function loginPage(req, res) {
  return res.render('login', {
    currentUser: req.user,
    error: req.query.error || '',
    pageTitle: 'Logg inn',
    success: req.query.success || '',
  });
}

async function readmePage(req, res) {
  const rawReadme = await fs.readFile(readmePath, 'utf8');
  const rendered = markdown.render(rawReadme);
  const safeReadme = sanitizeHtml(rendered, {
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      code: ['class'],
      pre: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'br',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'div',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'code',
      'blockquote',
      'hr',
    ]),
  });
  const finalReadme = safeReadme.replace(/&lt;br&gt;/g, '<br>');

  return res.render('readme', {
    currentUser: req.user,
    pageTitle: 'README preview',
    readmeHtml: finalReadme,
  });
}

module.exports = {
  home,
  loginPage,
  readmePage,
};
