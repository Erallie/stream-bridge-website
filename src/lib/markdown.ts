const escapeHtml=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const inline=(value:string)=>escapeHtml(value)
	.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" rel="noreferrer">$1</a>')
	.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
	.replace(/`([^`]+)`/g,'<code>$1</code>');
export function markdown(source:string):string{
	const lines=source.replace(/\r/g,'').split('\n');let html='',list=false;
	for(const raw of lines){const line=raw.trim();
		if(line.startsWith('- ')){if(!list){html+='<ul>';list=true}html+=`<li>${inline(line.slice(2))}</li>`;continue}
		if(list){html+='</ul>';list=false}
		if(!line)continue;
		const heading=line.match(/^(#{1,3})\s+(.+)$/);if(heading){const level=heading[1].length;html+=`<h${level}>${inline(heading[2])}</h${level}>`;continue}
		html+=`<p>${inline(line)}</p>`;
	}if(list)html+='</ul>';return html;
}
