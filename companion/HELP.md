## XKeys

Most [XKeys](https://xkeys.com/xkeys.html) products can be used with Companion.

We try to preserve the button layout that matches the xkeys, which is often larger than Companion's default grid. Due to the number of models, this may not always be accurate. Let us known on [GitHub](https://github.com/bitfocus/companion-surface-xkeys/issues) if yours is incorrect and we can try to resolve it.

### Setting Variables

There is limited support for T-bars and shuttle/jog wheels; their values can be exposed via custom variables.

To enable this feature you must first define custom variables. For example, got to the Custom Variables tab and add the following two variables: `$(custom:contourShuttleJog)` and `$(custom:contourShuttleRing)`...

![Define Contour Shuttle Variables](images/contour-shuttle-custom-variables.png?raw=true 'Define Contour Shuttle Variables')

Once the variables have been defined, go to the **_Configured Surfaces_** page and select the variables in the right-hand _Settings_ panel:

![Set Contour Shuttle Variables](images/contour-shuttle-set-custom-variables.png?raw=true 'Set Contour Shuttle Variables')

Now the variables will be set by the Contour Shuttle. Using the example names defined above:

- `$(custom:contourShuttleJog)` (+1/-1): indicates the rotational direction of the jog wheel for 20 ms after each click-stop.
- `$(custom:contourShuttleRing)` (-7 to +7): indicates the current shuttle position
