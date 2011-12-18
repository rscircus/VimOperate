addEventListener
(
	'DOMContentLoaded',
	function()
	{
	
		var settings = new Array("2", "2", "3", "0");

		var example = document.getElementById("example");
		var article = document.getElementById("articleContent");		
		var style =settings[0];
		var size = settings[1];
		var margin =settings[2];
		
				
		// storage
		var storage = widget.preferences;
		
		//storage.setItem("settings", setstr);
		
		// glue for multiple values ( checkbox, select-multiple )
		var glue    = '\n';

		// get the FORM elements
		var formElements = document.querySelectorAll( 'input,select' );

		// list of FORM elements
		var skip            = hash( 'hidden,submit,image,reset,button' );
		var multipleValues  = hash( 'checkbox,select-multiple' );
		var checkable       = hash( 'checkbox,radio' );

		// string to hash
		function hash( str, glue )
		{
			var obj = {};
			var tmp = str.split(glue||',');

			while( tmp.length )
				obj[ tmp.pop() ] = true;

			return obj;
		}

		// walk the elements and apply a callback method to them
		function walkElements( callback )
		{
			var obj = [];
			for( var i=0,element=null; element=formElements[i++]; )
			{
				// skip the element if it has no name or is of a type with no useful value
				var type = element.type.toLowerCase();
				var name = element.name||'';
				if( skip[type]===true || name=='') continue;

				var tmp = callback( element, name, type );
				if( tmp!=null )
					obj.push( tmp );
			}
			return obj;
		}

		// listener for element changes
		function changedElement( e )
		{
			var element = e.currentTarget||e;
			var type    = element.type.toLowerCase();
			var name    = element.name||'';
			var value   = multipleValues[type]!==true?element.value:walkElements
			(
				function( e, n, t )
				{
					if( n==name && e.options )
					{
						var tmp = [];
						for( var j=0,option=null; option=e.options[j++]; )
						{
							if( option.selected )
							{
								tmp.push( option.value );
							}
						}
						return tmp.join( glue );
					}
					else if( n==name && checkable[t]===true && e.checked )
					{
						return e.value;
					}
				}
			).join( glue );

			// set value
			storage.setItem( name, value );
			
			if( storage[name]==undefined )
				{
					changedElement( element );
				}

			if (value&&element.type=="radio")
				{
					
					if (element.name=="style")
					{ 
						settings[0]=element.value; 
						 style = "style-" + element.id;						
					}
					if (element.name=="size")
					{
						settings[1]=element.value; 
						size = "size-" + element.id;
					}
					if (element.name=="margin")
					{
						settings[2]=element.value; 
						margin = "margin-" + element.id;
					}
				}
				
			if (element.type=="checkbox")
				{
					if (element.checked)
						{ settings[3]="1"; }
					else
						{ settings[3]="0"; }
				}

			setstr=settings.join('');
			
			example.className = style;
			article.className = size + " " + margin;
			
			storage.setItem("settings", setstr);
		}
		
		// walk and set the elements accordingly to the storage
		walkElements
		(
			function( element, name, type )
			{
				var value       = storage[name]!==undefined?storage.getItem( name ):element.value;
				var valueHash   = hash( value, glue );

				if( element.selectedOptions )
				{
					// 'select' element
					for( var j=0,option=null; option=element.options[j++]; )
					{
						option.selected = valueHash[option.value]===true;
					}
				}
				else if( checkable[type]===true )
				{
					// 'checkable' element
					// element.checked = valueHash[element.value]===true;
/*q Notice: here the element.id as class if checked === true */
					if(element.checked = valueHash[element.value] === true)
					{
						switch(element.name)
						{
							case 'style':	example.className = style = 'style-' + element.id; break;
							case 'size':	article.className = size = 'size-' + element.id; break;
							case 'margin':	article.className += margin = ' margin-' + element.id; break;
							default: break;
						}
					}
				}
				else
				{
					// any other kind of element
					element.value = value;
				}
				
				 // set the widget.preferences to the value of the element if it was undefined
                // YOU MAY NOT WANT TO DO THIS
                if( storage[name]==undefined )
                {
                    changedElement( element );
                }
				
				// listen to changes
				element.addEventListener( 'change', changedElement, true );
			}
		);
	},
	false
);
