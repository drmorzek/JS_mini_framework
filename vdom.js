// создание ноды(не монтирование)
function h(tag, props, children) {
    return {
        tag, props, children
    }
}

// монтирование ноды
function mount(vnode, container){

    const el = document.createElement(vnode.tag);

    for (const key in vnode.props){
        el.setAttribute(key, vnode.props[key])
    }

    if (typeof vnode.children === "string") {
        el.textContent = vnode.children
    } else {
        vnode.children.forEach(child => {
            mount(child, el)
        });
    }

    container.appendChild(el)

    vnode.$el = el
}

// размонтирование ноды
function unmount(vnode){

    vnode.$el.parentNode.removeChild(vnode.$el)
}


// обновление ноды
function patch(node1, node2){


    if (node1.tag !== node2.tag) {
        mount(node2, node1.$el.parentNode)
        unmount(node1)
    } else {
        node2.$el = node1.$el
        
        if (typeof node2.children === "string") {
            node2.$el.textContent = node2.children

            
        } else {
            while(node2.$el.attributes.length >0){
                console.log(node2.$el.attributes.length)
                node2.$el.removeAttribute(node2.$el.attributes[0].name)

                for (const key in node2.props) {
                    node2.$el.setAttribute(key, node2.props[key])
                }

                if (typeof node1.children === "string") {
                    node2.$el.textContent = null
                    node2.children.forEach(child => {
                        mount(child, node2.$el)
                    });
                } else {
                    const commonLength = Math.min(node2.children.length, node1.children.length)

                    for (let i = 0; i < commonLength; i++) {
                        patch(node1.children[i], node2.children[i])
                    }

                    if (node1.children.length > node2.children.length) {
                        node1.children.slice(node2.children.length).forEach(child => {
                            unmount(child )
                        })
                    } 
                    else if (node2.children.length > node1.children.length) {
                        node2.children.slice(node1.children.length).forEach(child => {
                            mount(child)
                        })
                    }
                }
            }
        }
    }

}


//функционал реактивности
let activeEffect;

function watchEffect(fn){
    activeEffect = fn
    fn()
    activeEffect = null
}

class Dependency{

    constructor(){
        this.subscribers = new Set()
    }

    depend(){
        if(activeEffect) {
            this.subscribers.add(activeEffect)
        }
    }

    notify(){
        this.subscribers.forEach(sub => sub())
    }
}

function reactivity(obj){
    Object.keys(obj).forEach(key => {

        const dep = new Dependency()
        let value = obj[key]


        Object.defineProperty(obj, key, {
            get(){
                dep.depend()
                return value
            },
            set(newValue){
                if(newValue != value){
                    value = newValue
                    dep.notify()
                }
            }
        })

    })

    return obj
}