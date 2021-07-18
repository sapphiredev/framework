# Creating listeners

## Setting up the file structure

Sapphire loads events the same way as it loads command, by automatically reading files in the `listeners` folder. You
should now create such a folder, and add your first listeners in it.

### Ready listener

To create an listener you simply need to create a file with the name of the listener, in our case `ready.js`.

Each listener is a class that extends from the base `Listener` class from Sapphire. You need to extend it, and add a
`run` method which works the same way as for commands.

```javascript
const { Listener } = require('@sapphire/framework');

module.exports = class extends Listener {
	constructor(context) {
		super(context, {
			once: true
		});
	}

	async run() {
		this.container.logger.info('The bot is up and running!');
	}
};
```

The first parameter of `super` is the context, that is given in the constructor. You can then specify an
{@link ListenerOptions} object, containing properties such as the emitter's, the listener's name, and
whether it should only be run once (`once`). The emitter defaults to the the client, and the listener name default to
the file name.

The `run` method is the method that gets called when the event occurs. It takes whatever the events gives as argument.
In our case, the ready events gives no information so we don't need any parameter.

Every piece (listeners, commands etc) in sapphire has a `container` which can be accessed via
`this.container`. It is this container that contains the logger, the client and other properties. Here we access the
logger via `this.container.logger` and call its `info` method to print a nicely formatted message in the console.

If everything was done correctly, now, whenever you launch your bot, you will see a message in the console.
