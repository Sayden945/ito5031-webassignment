# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, listCharities, registerForEvent, listMyDonations } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation ListCharities: 
const { data } = await ListCharities(dataConnect);

// Operation RegisterForEvent:  For variables, look at type RegisterForEventVars in ../index.d.ts
const { data } = await RegisterForEvent(dataConnect, registerForEventVars);

// Operation ListMyDonations: 
const { data } = await ListMyDonations(dataConnect);


```