using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace GeneralWebApi.Common.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]

// disable the form value model binding: IFormFile
// prevent the middleware to read the form 

// example:
// before: request -> FormFileValueProviderFactory -> IFormFile -> bind to the input parameter
// after: request -> factory disabled -> no input parameter binding
// need to read the form data amnually using HttpContext.Request.Form
public class DisableFormValueModelBindingAttribute : Attribute, IResourceFilter
{
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        var factories = context.ValueProviderFactories;
        factories.RemoveType<FormValueProviderFactory>();
        factories.RemoveType<FormFileValueProviderFactory>();
        factories.RemoveType<JQueryFormValueProviderFactory>();
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
    }
}