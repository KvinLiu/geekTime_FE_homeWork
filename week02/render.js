const getUuid = () => {
	return window.crypto.getRandomValues(new Uint32Array(1))[0].toString(32);
}

class VNode {
	constructor(tag, attr, children, parent, childrenTemplate) {
		this.tag = tag;
		this.attr = attr;
		this.children = children;
		this.parent = parent;
		this.childrenTemplate = childrenTemplate;
		this.uuid = getUuid();
	}
}

class Engine {
	constructor() {
		this.nodes = new Map();
	}

	render = (tmpl, data) => {
		const rootNode = this.setNodes(tmpl);
		return this.parseNodeToDom(rootNode, data);
	}

	setNodes = (tmpl) => {
		const re1 = /<(\w+)\s*([^>]*)>([^<]*)<\/\1>/gm;
		const re2 = /<(\w+)\s*([^(/>)]*)\/>/gm;

		let template = tmpl.replace(/\n/gm, "");
		while (re1.test(template) || re2.test(template)) {
			template = template.replace(re1, (s0, s1, s2, s3) => {
				let attr = this.parseAttribute(s2);
				let node = new VNode(s1, attr, [], null, s3);
				this.nodes.set(node.uuid, node);
				return `(${node.uuid})`;
			});

			template = template.replace(re2, (s0, s1, s2) => {
				let attr = this.parseAttribute(s2);
				let node = new VNode(s1, attr, [], null, "");
				this.nodes.set(node.uuid, node);
				return `(${node.uuid})`;
			});
		}
		return this.parseToNode(template);
	};

	parseAttribute(str) {
		let attr = new Map();
		str = str.trim();
		str.replace(/([\w|-]+)\s*=['"](.*?)['"]/gm, (s0, s1, s2) => {
			attr.set(s1, s2);
			return s0;
		});
		return attr;
	}

	parseToNode(template) {
		let re = /\((.*?)\)/g;
		let stack = [];
		let parent = new VNode("root", {}, [], null, template, null);
		stack.push(parent);
		//转成成node节点
		while (stack.length > 0) {
			let pNode = stack.pop();
			let nodeStr = pNode.childrenTemplate.trim();
			re.lastIndex = 0;
			[...nodeStr.matchAll(re)].forEach((item) => {
				let n = this.nodes.get(item[1]);
				let newNode = new VNode(
					n.tag,
					n.attr,
					[],
					pNode,
					n.childrenTemplate,
					null
				);
				pNode.children.unshift(newNode);
				stack.push(newNode);
			});
		}
		return parent.children[0];
	}

	parseNodeToDom(root, data) {
		let fragment = document.createDocumentFragment();
		let stack = [[root, fragment, data]];
		//转成成node节点
		while (stack.length > 0) {
			let [pNode, pDom, scope] = stack.pop();
			if (pNode.attr.get("v-if")) {
				let [key, prop] = pNode.attr.get("v-if").split(".");
				key = key.trim();
				prop = prop.trim();
				const isRender = scope[key][prop];
				if (!isRender) {
					continue;
				}
			}

			const html = this.scopeHtmlParse(pNode, data, scope);
			const ele = this.createElement(pNode, html);
			this.scopeAttrParse(ele, pNode, data, scope);
			pDom.appendChild(ele);

			for (let i = 0; i < pNode.children?.length; i++) {
				stack.push([pNode.children[i], ele, scope]);
			}
		}
		return fragment;
	}

	scopeHtmlParse(node, globalScope, currentScope) {
		return node.childrenTemplate.replace(/{{(.*?)}}/g, (s0, s1) => {
			let props = s1.split(".");
			let val = currentScope[props[0]] || globalScope[props[0]];
			props.slice(1).forEach((item) => {
				val = val[item];
			});
			return val;
		});
	}

	scopeAttrParse(ele, node, globalScope, currentScope) {
		for (let [key, value] of node.attr) {
			let result = /{{(.*?)}}/.exec(value);
			if (result && result.length > 0) {
				let props = result[1].split(".");
				let val = currentScope[props[0]] || globalScope[props[0]];
				props.slice(1).forEach((item) => {
					val = val[item];
				});
				ele.setAttribute(key, val);
			}
		}
	}

	createElement(node, html) {
		let ignoreAttr = ["v-if"];
		let dom = document.createElement(node.tag);
		for (let [key, val] of node.attr) {
			if (!ignoreAttr.includes(key)) {
				dom.setAttribute(key, val);
			}
		}
		if (node.children.length === 0) {
			dom.innerHTML = html;
		}
		return dom;
	}
}

const render = (tmpl, data = {}, selector = '') => {
	const engine = new Engine();
	return engine.render(tmpl, data);
};

const tmpl = `
    <div class="newslist">
        <div class="img" v-if="info.showImage">
            <img src="{{image}}" />
        </div>
        <div class="date" v-if="info.showDate">
            {{info.name}}
        </div>
        <div class="img">
            {{info.name}}
        </div>
    </div>
`;

const data = {
	image: "some img",
	info: { showImage: true, showDate: true, name: "aaa" }
};

const dom = render(tmpl, data);
document.querySelector('#root').appendChild(dom)
console.log(dom);