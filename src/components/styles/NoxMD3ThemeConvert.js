// https://www.logicui.com/colorgenerator

const md3String = `
Primary	#E6E67F
OnPrimary	#4C4C00
PrimaryContainer	#666600
OnPrimaryContainer	#E6E69D

Secondary	#D8D2E6
OnSecondary	#433E4C
SecondaryContainer	#595366
OnSecondaryContainer	#DCD8E6

Tertiary	#E6C3CE
OnTertiary	#4C323B
TertiaryContainer	#66434F
OnTertiaryContainer	#E6CDD5

Error	#E69490
OnError	#4C100D
ErrorContainer	#661511
OnErrorContainer	#E6ACA9

Background	#333330
OnBackground	#e6e6e2
Surface	#333330
OnSurface	#e6e6e2
SurfaceVariant	#666652
OnSurfaceVariant	#e6e6d1
Outline	#b3b39c
`;

const result = {};

md3String.split('\n').forEach(line => {
  if (line.length === 0) {
    return;
  }
  const [key, value] = line.split('	');
  result[`${key[0].toLowerCase()}${key.slice(1)}`] = value;
});

console.log(result);
