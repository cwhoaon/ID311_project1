class Subject {
    constructor() {
      this.observers = [];
    }
  
    subscribe(observer) {
      if (observer != null) this.observers.push(observer);
    }
  
    unsubscribe(observer) {
      if (observer == null) return;
      this.observers = this.observers.filter((e) => e != observer);
    }
  
    unsubscribeAll() {
      this.observers = [];
    }
  
    notifySubscribers(source, ...others) {
      for (let o of this.observers) {
        if (o != null) o.update(source, ...others);
      }
    }
  }
  
  export { Subject };
  