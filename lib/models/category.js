class Category {
    constructor(name, content, repeatable) {
        this.content = content;
        this.id = '';
        this.isRepeatable = repeatable;
        this.name = name;
    }
}

module.exports = Category;
