import { marked, Renderer } from 'marked';

function createSlug(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/\p{Mark}/gu, '')
		.toLowerCase()
		.replace(/<[^>]*>/g, '')
		.replace(/&[a-z0-9#]+;/gi, '')
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '');
}

export function renderLegalMarkdown(source: string): string {
	const renderer = new Renderer();
	const usedSlugs = new Map<string, number>();

	renderer.heading = function ({ tokens, depth }) {
		const contents = this.parser.parseInline(tokens);

		const baseSlug = createSlug(tokens.map((token) => token.raw).join('')) || 'section';

		const previousUses = usedSlugs.get(baseSlug) ?? 0;
		const slug = previousUses === 0 ? baseSlug : `${baseSlug}-${previousUses + 1}`;

		usedSlugs.set(baseSlug, previousUses + 1);

		return `
            <h${depth} id="${slug}">
                <a class="heading-link" href="#${slug}">
                    ${contents}
                </a>
            </h${depth}>
        `;
	};

	return marked.parse(source, {
		renderer,
		async: false
	});
}
