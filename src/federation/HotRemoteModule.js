const HotRemoteModule = ({ mod }) => {
 
    return (
      <System
        key={key}
        system={{
          module: mod.module,
          url: mod.url,
          scope: mod.scope,
        }}
        sharedProps={sharedProps}
        module={mod}
        config={config}
      />
    );
  };